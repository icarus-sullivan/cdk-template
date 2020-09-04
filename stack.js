#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');
const ecsPatterns = require('@aws-cdk/aws-ecs-patterns');

const path = require('path');

const CONFIG = {
    name: 'ExperimentalStack',
    vpcName: 'ExperimentalVpc',
    clusterName: 'ExperimentalCluster',
    fargateName: 'ExperimentalFargate',
}

class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
  
        const vpc = new ec2.Vpc(this, CONFIG.vpcName, { maxAzs: 3 });
        const cluster = new ecs.Cluster(this, CONFIG.clusterName, { vpc });
        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, CONFIG.fargateName, {
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, 'docker')),
                containerPort: 3000,
            },
        });
    }
}

module.exports = new CdkStack(
    new cdk.App(),
    CONFIG.name,
);
