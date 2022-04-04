FROM nginxinc/nginx-unprivileged
WORKDIR /usr/share/nginx/html

COPY apps/frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY dist/apps/frontend .
