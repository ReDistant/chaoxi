FROM python:slim

RUN apt update \
		&& apt install -y nocache wget unzip \
		&& wget https://github.com/projectdiscovery/subfinder/releases/download/v2.5.1/subfinder_2.5.1_linux_amd64.zip \
		&& unzip subfinder_2.5.1_linux_amd64.zip \
		&& rm -rf subfinder_2.5.1_linux_amd64.zip
