FROM php:8.2-apache

# Dependências para o Composer (zip + git para download de pacotes)
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

# Instala Composer a partir da imagem oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Configura Apache: document root aponta para /var/www/public (pasta conexte)
# vendor/ fica em /var/www/vendor/ — fora do webroot por segurança
RUN printf '<VirtualHost *:80>\n\
    DocumentRoot /var/www/public\n\
    <Directory /var/www/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options -Indexes\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>\n' > /etc/apache2/sites-available/000-default.conf

# Instala PHPMailer
COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copia os arquivos do site para o webroot
COPY conexte/ public/

EXPOSE 80
