variable "bucket" {
    default = "meicm-project2-frontend-bucket" 
}
variable "frontend_folder" {
    default = "../../../src/frontend"
}

resource "random_string" "random" {
  length          = 4
  special         = false
  number          = false
  upper = false 
}

locals {
  bucket_name = "${var.bucket}${random_string.random.result}"
}


resource "aws_s3_bucket" "meicm_project2_frontend" {
  bucket = local.bucket_name
  acl    = "public-read"
  force_destroy = true
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::${local.bucket_name}/*"
            ]
        }
    ]
}
EOF

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  provisioner "local-exec" {
    command = <<EOT
aws s3 cp ${var.frontend_folder}/ s3://${local.bucket_name} --recursive 
EOT
  }
}

output "aws_s3_website_endpoint" {
  value       = aws_s3_bucket.meicm_project2_frontend.website_endpoint
  description = "S3 URL"
}
