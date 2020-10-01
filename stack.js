#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');
const ecsPatterns = require('@aws-cdk/aws-ecs-patterns');
const certificateManager = require('@aws-cdk/aws-certificatemanager');
const route53 = require('@aws-cdk/aws-route53');

const path = require('path');

const CONFIG = {
    name: 'exp',

    dockerDirectory: path.resolve(__dirname, 'docker'),

    certificateArn: 'your_arn_here',

    domains: {
        hostedDomain: 'domain.here',
        outputDomain: 'subdomain.domain.here', // can be sub or same as hosted
    },

    env: {
        region: 'us-east-1',
        account: 'your_account_id',
        stage: 'dev',
    }
}

const resolveName = (name, config) => [config.name, name, config.env.stage].join('-');

const resolveZone = (domainName) => route53.HostedZone.fromLookup(this, 'ez', { 
    domainName,
});

const resolveCertificate = (arn) =>
    certificateManager.Certificate.fromCertificateArn(this, 'ct', arn);

class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        const { 
            certificateArn, 
            dockerDirectory,
            domains: { 
                hostedDomain, 
                outputDomain 
            } 
        } = CONFIG;

        const vpcName = resolveName('vpc', CONFIG);
        const clusterName = resolveName('cluster', CONFIG);
        const fargateName = resolveName('fargate', CONFIG);
  
        const vpc = new ec2.Vpc(this, vpcName, { maxAzs: 3, vpcId: vpcName });
        const cluster = new ecs.Cluster(this, clusterName, { vpc, clusterName });

        const existingZone = resolveZone(hostedDomain);
        const certificate = resolveCertificate(certificateArn);

        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, fargateName, {
            serviceName: fargateName,
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset(dockerDirectory),
                containerPort: 3000,
            },
            certificate,
            domainName: outputDomain,
            domainZone: existingZone,
        });
    }
}

module.exports = new CdkStack(new cdk.App(), CONFIG.name, { env: CONFIG.env });
