resource "aws_vpc" "meicm" {
  cidr_block = "10.0.0.0/16"
  tags = {
    "kubernetes.io/cluster/${var.cluster}" = "shared"
  }
}
resource "aws_subnet" "meicm" {
  count                   = 2
  vpc_id                  = aws_vpc.meicm.id
  cidr_block              = "10.0.${count.index}.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  tags = {
    "kubernetes.io/cluster/${var.cluster}" = "shared"
  }
}

resource "aws_security_group" "meicm" {
  name        = "meicm"
  description = "MEICM Security Group"

  vpc_id = aws_vpc.meicm.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.local_ip]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_internet_gateway" "meicm" {
  vpc_id = aws_vpc.meicm.id
}


resource "aws_route_table" "meicm" {
  vpc_id = aws_vpc.meicm.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.meicm.id
  }
}

resource "aws_route_table_association" "meicm" {
  count          = 2
  subnet_id      = aws_subnet.meicm.*.id[count.index]
  route_table_id = aws_route_table.meicm.id
}
