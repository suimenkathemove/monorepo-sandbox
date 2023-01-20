export const vpcId = "slackCloneVpc";

export const subnetIds = {
  ingress: {
    a: "slackCloneSubnetPublicIngress1A",
    c: "slackCloneSubnetPublicIngress1C",
  },
  app: {
    a: "slackCloneSubnetPrivateApp1A",
    c: "slackCloneSubnetPrivateApp1C",
  },
  db: {
    a: "slackCloneSubnetPrivateDb1A",
    c: "slackCloneSubnetPrivateDb1C",
  },
} as const satisfies Record<string, Record<"a" | "c", string>>;