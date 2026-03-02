FROM ubuntu:24.04

WORKDIR /server

RUN apt-get update && apt-get install -y \
    libwebsockets-dev \
    libssl-dev \
    build-essential \
    libglib2.0-dev 

COPY . .

EXPOSE 8332

RUN make

CMD ["./main"]