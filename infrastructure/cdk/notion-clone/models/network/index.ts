import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { availabilityZones } from "./availability-zones";
import { cidrBlocks } from "./cidr-blocks";
import { routeTableIds, subnetRouteTableAssociationIds } from "./route-tables";
import { subnetIds } from "./subnets";
import { vpcEndpoints, vpcId } from "./vpcs";

const createVpc = (scope: Construct): cdk.aws_ec2.CfnVPC => {
  return new cdk.aws_ec2.CfnVPC(scope, vpcId, {
    cidrBlock: cidrBlocks.notionCloneVpc,
    enableDnsHostnames: true,
    enableDnsSupport: true,
  });
};

const createIngressSubnet = (
  scope: Construct,
  props: { vpcId: string },
): {
  subnetA: cdk.aws_ec2.CfnSubnet;
  subnetC: cdk.aws_ec2.CfnSubnet;
  routeTable: cdk.aws_ec2.CfnRouteTable;
} => {
  const subnetA = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.ingress.a, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.a,
    cidrBlock: cidrBlocks.notionCloneSubnetPublicIngress1A,
  });
  const subnetC = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.ingress.c, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.c,
    cidrBlock: cidrBlocks.notionCloneSubnetPublicIngress1C,
  });

  const routeTable = new cdk.aws_ec2.CfnRouteTable(
    scope,
    routeTableIds.ingress,
    {
      vpcId: props.vpcId,
    },
  );

  new cdk.aws_ec2.CfnSubnetRouteTableAssociation(
    scope,
    subnetRouteTableAssociationIds.ingress.a,
    {
      subnetId: subnetA.ref,
      routeTableId: routeTable.ref,
    },
  );
  new cdk.aws_ec2.CfnSubnetRouteTableAssociation(
    scope,
    subnetRouteTableAssociationIds.ingress.c,
    {
      subnetId: subnetC.ref,
      routeTableId: routeTable.ref,
    },
  );

  return { subnetA, subnetC, routeTable };
};

const createAppSubnet = (
  scope: Construct,
  props: { vpcId: string },
): {
  subnetA: cdk.aws_ec2.CfnSubnet;
  subnetC: cdk.aws_ec2.CfnSubnet;
  routeTable: cdk.aws_ec2.CfnRouteTable;
} => {
  const subnetA = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.app.a, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.a,
    cidrBlock: cidrBlocks.notionCloneSubnetPrivateApp1A,
  });
  const subnetC = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.app.c, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.c,
    cidrBlock: cidrBlocks.notionCloneSubnetPrivateApp1C,
  });

  const routeTable = new cdk.aws_ec2.CfnRouteTable(scope, routeTableIds.app, {
    vpcId: props.vpcId,
  });

  new cdk.aws_ec2.CfnSubnetRouteTableAssociation(
    scope,
    subnetRouteTableAssociationIds.app.a,
    {
      subnetId: subnetA.ref,
      routeTableId: routeTable.ref,
    },
  );
  new cdk.aws_ec2.CfnSubnetRouteTableAssociation(
    scope,
    subnetRouteTableAssociationIds.app.c,
    {
      subnetId: subnetC.ref,
      routeTableId: routeTable.ref,
    },
  );

  return { subnetA, subnetC, routeTable };
};

const createDbSubnet = (
  scope: Construct,
  props: { vpcId: string },
): {
  subnetA: cdk.aws_ec2.CfnSubnet;
  subnetC: cdk.aws_ec2.CfnSubnet;
  routeTable: cdk.aws_ec2.CfnRouteTable;
} => {
  const subnetA = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.db.a, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.a,
    cidrBlock: cidrBlocks.notionCloneSubnetPrivateDb1A,
  });
  const subnetC = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.db.c, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.c,
    cidrBlock: cidrBlocks.notionCloneSubnetPrivateDb1C,
  });

  const routeTable = new cdk.aws_ec2.CfnRouteTable(scope, routeTableIds.db, {
    vpcId: props.vpcId,
  });

  new cdk.aws_ec2.CfnSubnetRouteTableAssociation(
    scope,
    subnetRouteTableAssociationIds.db.a,
    {
      subnetId: subnetA.ref,
      routeTableId: routeTable.ref,
    },
  );
  new cdk.aws_ec2.CfnSubnetRouteTableAssociation(
    scope,
    subnetRouteTableAssociationIds.db.c,
    {
      subnetId: subnetC.ref,
      routeTableId: routeTable.ref,
    },
  );

  return { subnetA, subnetC, routeTable };
};

const createEgressSubnet = (
  scope: Construct,
  props: { vpcId: string },
): {
  subnetA: cdk.aws_ec2.CfnSubnet;
  subnetC: cdk.aws_ec2.CfnSubnet;
} => {
  const subnetA = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.egress.a, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.a,
    cidrBlock: cidrBlocks.notionCloneSubnetEgressA,
  });
  const subnetC = new cdk.aws_ec2.CfnSubnet(scope, subnetIds.egress.c, {
    vpcId: props.vpcId,
    availabilityZone: availabilityZones.c,
    cidrBlock: cidrBlocks.notionCloneSubnetEgressC,
  });

  new cdk.aws_ec2.CfnVPCEndpoint(scope, vpcEndpoints.ecr.api, {
    vpcEndpointType: "Interface",
    serviceName: "com.amazonaws.ap-northeast-1.ecr.api",
    vpcId: props.vpcId,
    subnetIds: [subnetA.ref, subnetC.ref],
  });
  new cdk.aws_ec2.CfnVPCEndpoint(scope, vpcEndpoints.ecr.dkr, {
    vpcEndpointType: "Interface",
    serviceName: "com.amazonaws.ap-northeast-1.ecr.dkr",
    vpcId: props.vpcId,
    subnetIds: [subnetA.ref, subnetC.ref],
  });
  new cdk.aws_ec2.CfnVPCEndpoint(scope, vpcEndpoints.cloudWatch, {
    vpcEndpointType: "Interface",
    serviceName: "com.amazonaws.ap-northeast-1.logs",
    vpcId: props.vpcId,
    subnetIds: [subnetA.ref, subnetC.ref],
  });

  return { subnetA, subnetC };
};

const createS3VpcEndpoint = (
  scope: Construct,
  props: { vpcId: string; appRouteTableId: string },
) => {
  new cdk.aws_ec2.CfnVPCEndpoint(scope, vpcEndpoints.s3, {
    vpcEndpointType: "Gateway",
    serviceName: "com.amazonaws.ap-northeast-1.s3",
    vpcId: props.vpcId,
    routeTableIds: [props.appRouteTableId],
  });
};

export const createNetwork = (scope: Construct) => {
  const vpc = createVpc(scope);

  createIngressSubnet(scope, { vpcId: vpc.ref });

  const appSubnet = createAppSubnet(scope, { vpcId: vpc.ref });

  createDbSubnet(scope, { vpcId: vpc.ref });

  createEgressSubnet(scope, { vpcId: vpc.ref });

  createS3VpcEndpoint(scope, {
    vpcId: vpc.ref,
    appRouteTableId: appSubnet.routeTable.ref,
  });
};
