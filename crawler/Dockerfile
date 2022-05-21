FROM golang:alpine as builder

RUN apk --no-cache add git

WORKDIR /go/src/talentsec.cn/lev/crawler/

# RUN go get -d -v github.com/go-rod/rod
RUN go install github.com/go-rod/rod@latest

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o crawler .

FROM zenika/alpine-chrome as prod

USER root
RUN apk --no-cache add ca-certificates jq curl
COPY --from=0 /go/src/talentsec.cn/lev/crawler/crawler /usr/local/bin
COPY lev /bin

USER chrome
ENTRYPOINT ["/bin/lev"]
