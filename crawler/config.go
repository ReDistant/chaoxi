package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/url"
	"os"

	p "github.com/go-rod/rod/lib/proto"
)

type _URL struct {
	URL **url.URL
}

func (v _URL) String() string {
	if v.URL != nil {
		return (*v.URL).Redacted()
	}
	return ""
}

func (v _URL) Set(s string) error {
	if u, err := url.Parse(s); err != nil {
		return err
	} else {
		*v.URL = u
	}
	return nil
}

type _Cookies struct {
	cookies *[]*p.NetworkCookie
}

func (v _Cookies) String() string {
	s, _ := json.Marshal(v.cookies)
	return string(s)
}

func (v _Cookies) Set(s string) error {
	return json.Unmarshal([]byte(s), v.cookies)
}

type Config struct {
	limit    int
	path     string
	headless bool
	target   *url.URL
	cookies  []*p.NetworkCookie
}

var config Config

func init() {
	path := "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
	c := &config

	flag.IntVar(&c.limit, "tl", 1, "Tab limit")
	flag.StringVar(&c.path, "p", path, "Chrome excutable path")
	flag.BoolVar(&c.headless, "s", false, "Headless")
	flag.Var(&_URL{&c.target}, "u", "Target URL")
	flag.Var(&_Cookies{&c.cookies}, "c", "Cookies")
	flag.Parse()

	if c.target == nil {
		flag.Usage()
		os.Exit(-1)
	}
	log.Printf("%+v\n", c)
}
