FROM nginx:alpine

# Copy the Nginx template
COPY api-gateway/default.conf.template /etc/nginx/templates/default.conf.template

# Copy the frontend files to Nginx's serving directory
COPY frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]