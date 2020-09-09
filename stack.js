#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');
const ecsPatterns = require('@aws-cdk/aws-ecs-patterns');

const path = require('path');

const CONFIG = {
    name: 'exp',
    vpcName: 'expVpc',
    clusterName: 'expCluster',
    fargateName: 'expFargate',

    dockerDirectory: path.resolve(__dirname, 'docker'),

    alias: {
        recordName: 'www',
        domainName: 'domain.here',
    }
}

class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
  
        const vpc = new ec2.Vpc(this, CONFIG.vpcName, { maxAzs: 3 });
        const cluster = new ecs.Cluster(this, CONFIG.clusterName, { vpc });
        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, CONFIG.fargateName, {
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset(CONFIG.dockerDirectory),
                containerPort: 3000,
            },
        });

        // Create hosted zone elsewhere, may need to set up env
        const { recordName, domainName } = CONFIG.alias;
        const zone = route53.HostedZone.fromLookup(this, 'expZone', { 
            domainName 
        });

        new route53.ARecord(this, 'exprecord', {
            zone,
            recordName,
            target: route53.RecordTarget.fromAlias(new alias.LoadBalancerTarget(fargateService.loadBalancer)),
        });
    }
}

module.exports = new CdkStack(
    new cdk.App(),
    CONFIG.name,
    {
        env: {
            region: 'us-east-1',
            account: 'your_account_id',
        }
    }
);
