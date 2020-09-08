#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');
const ecsPatterns = require('@aws-cdk/aws-ecs-patterns');
const serviceDiscovery = require('@aws-cdk/aws-servicediscovery');

const path = require('path');

const CONFIG = {
    name: 'exp',
    vpcName: 'expVpc',
    clusterName: 'expCluster',
    fargateName: 'expFargate',
    namespaceName: 'expNsp',
    namespaceDomain: 'your.domain.here',
    serviceName: 'expSer',
    serviceKey: 'explb',

    dockerDirectory: path.resolve(__dirname, 'docker'),
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

        const namespace = new serviceDiscovery.PublicDnsNamespace(this, CONFIG.namespaceName, {
            name: CONFIG.namespaceDomain,
            vpc,
        });
        
        const service = namespace.createService(CONFIG.serviceName, {
            dnsRecordType: serviceDiscovery.DnsRecordType.A_AAAA,
            dnsTtl: cdk.Duration.seconds(30),
            loadBalancer: true,
        });

        service.registerLoadBalancer(CONFIG.serviceKey, fargateService.loadBalancer);
    }
}

module.exports = new CdkStack(
    new cdk.App(),
    CONFIG.name,
);
