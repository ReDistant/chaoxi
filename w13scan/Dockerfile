FROM python:3.6.15-alpine

RUN apk add --no-cache git && apk add --no-cache musl-dev && apk add --no-cache linux-headers && apk add --no-cache gcc && apk add --no-cache libffi-dev && apk add --no-cache unzip && apk add --no-cache openssl-dev && apk add --no-cache libxml2-dev && apk add --no-cache libxslt-dev

WORKDIR /lev/

COPY ./w13scan.zip ./
RUN unzip w13scan.zip

#RUN git clone https://github.com/w-digital-scanner/w13scan.git  
RUN pip install -r /lev/w13scan-master/requirements.txt
