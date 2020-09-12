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
    vpcName: 'expVpc',
    clusterName: 'expCluster',
    fargateName: 'expFargate',

    dockerDirectory: path.resolve(__dirname, 'docker'),

    certificateArn: 'your_arn_here',

    domains: {
        hostedDomain: 'domain.here',
        outputDomain: 'subdomain.domain.here', // can be sub or same as hosted
    },

    env: {
        region: 'us-east-1',
        account: 'your_account_id',
    }
}

const resolveZone = (domainName) => route53.HostedZone.fromLookup(this, 'ez', { 
    domainName,
});

const resolveCertificate = (arn) =>
    certificateManager.Certificate.fromCertificateArn(this, 'ct', arn);

class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
  
        const vpc = new ec2.Vpc(this, CONFIG.vpcName, { maxAzs: 3 });
        const cluster = new ecs.Cluster(this, CONFIG.clusterName, { vpc });

        const { hostedDomain, outputDomain } = CONFIG.domains;
        const existingZone = resolveZone(hostedDomain);
        const certificate = resolveCertificate(CONFIG.certificateArn);

        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, CONFIG.fargateName, {
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset(CONFIG.dockerDirectory),
                containerPort: 3000,
            },
            certificate,
            domainName: outputDomain,
            domainZone: existingZone,
        });
    }
}

module.exports = new CdkStack(new cdk.App(), CONFIG.name, { env: CONFIG.env });
