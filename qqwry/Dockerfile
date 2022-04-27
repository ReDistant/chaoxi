FROM python:3.6.15-alpine

WORKDIR /lev/

#COPY ./requirements.txt ./
#COPY ./main.py ./
COPY ./nali-linux-amd64-v0.3.9.gz ./
RUN gzip /lev/nali-linux-amd64-v0.3.9.gz -d
RUN mv nali-linux-amd64-v0.3.9 nali
RUN chmod +x nali
RUN /lev/nali "8.8.8.8"

#RUN pip install -r requirements.txt
