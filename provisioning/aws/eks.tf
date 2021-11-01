resource "aws_eks_cluster" "meicm_eks" {
  name     = var.cluster
  role_arn = aws_iam_role.meicm_eks.arn

  vpc_config {
    security_group_ids = [aws_security_group.meicm.id]
    subnet_ids         = aws_subnet.meicm[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.meicm-AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.meicm-AmazonEKSServicePolicy,
  ]
}

resource "aws_eks_node_group" "meicm_eks_nodes" {
  cluster_name    = aws_eks_cluster.meicm_eks.name
  node_group_name = "meicm_eks_nodes"
  node_role_arn   = aws_iam_role.meicm_worker_nodes.arn
  subnet_ids      = aws_subnet.meicm[*].id

  scaling_config {
    desired_size = 1
    max_size     = 1
    min_size     = 1
  }

  tags = {
    "kubernetes.io/cluster/meicm_bookmanager_eks" = "owned"
  }

  depends_on = [
    aws_iam_role_policy_attachment.meicm-AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.meicm-AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.meicm-AmazonEC2ContainerRegistryReadOnly
  ]
}



resource "aws_iam_role" "meicm_eks" {
  name = "meicm_eks"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role" "meicm_worker_nodes" {
  name = "meicm_worker_nodes"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}



resource "aws_iam_role_policy_attachment" "meicm-AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.meicm_eks.name
}

resource "aws_iam_role_policy_attachment" "meicm-AmazonEKSServicePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
  role       = aws_iam_role.meicm_eks.name
}

resource "aws_iam_role_policy_attachment" "meicm-AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.meicm_worker_nodes.name
}

resource "aws_iam_role_policy_attachment" "meicm-AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.meicm_worker_nodes.name
}

resource "aws_iam_role_policy_attachment" "meicm-AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.meicm_worker_nodes.name
}


output "aws_eks_cluster_name" {
  value       = aws_eks_cluster.meicm_eks.name
  description = "EKS NAME"
}
