# #!/bin/bash

# # create ssl certificates using certbot
# DOMAIN="nordwyn.net"  # Replace with your domain
# EMAIL="keller_jens@hotmail.com"
# # Install certbot if not already installed
# if ! command -v certbot &> /dev/null; then
#     echo "Certbot not found, installing..."
#     yum install -y certbot
# fi
# # Create a directory for the certificates
# CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
# mkdir -p $CERT_DIR
# # Obtain the SSL certificate
# certbot certonly --standalone --non-interactive --agree-tos --email $EMAIL -d $DOMAIN
# # Check if the certificate was created successfully
# if [ -d "$CERT_DIR" ]; then
#     echo "SSL certificate created successfully at $CERT_DIR"
# else
#     echo "Failed to create SSL certificate"
#     exit 1
# fi
# # Copy the certificate and key to the appropriate locations
# cp "$CERT_DIR/fullchain.pem" /etc/ssl/certs/$DOMAIN.crt
# cp "$CERT_DIR/privkey.pem" /etc/ssl/private/$DOMAIN.key
# # Set appropriate permissions
# chmod 644 /etc/ssl/certs/$DOMAIN.crt
# chmod 600 /etc/ssl/private/$DOMAIN.key

# # maintain a cron job to renew the certificate if not existing
# echo "0 0 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew
# # Ensure the cron service is running
# service crond start
