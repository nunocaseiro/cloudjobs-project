provider "aws" {
  region = "eu-west-2"
}

data "aws_region" "current" {}

data "aws_availability_zones" "available" {}
