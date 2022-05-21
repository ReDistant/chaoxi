package main

import (
	_ "embed"
	"log"
	"net/url"
	"strings"
	"sync"

	"github.com/go-rod/rod"
	p "github.com/go-rod/rod/lib/proto"
)

//go:embed inject/filler.js
var FillerScript string

type Request struct {
	Type     p.NetworkResourceType `json:"type"`
	Method   string                `json:"method"`
	URL      string                `json:"url"`
	PostData string                `json:"data,omitempty"`
}

func NewRequest(url string) *Request {
	return &Request{
		Method: "GET",
		URL:    config.target.String(),
		Type:   p.NetworkResourceTypeDocument,
	}
}

func (r *Request) continueRequest(id p.FetchRequestID) p.FetchContinueRequest {
	return p.FetchContinueRequest{
		RequestID: id,
		URL:       r.URL,
		Method:    r.Method,
		PostData:  []byte(r.PostData),
	}
}

type Analyzer interface {
	Analyze(page *rod.Page, url string)
}

type Crawler struct {
	browser   *rod.Browser
	allow     []string
	limit     chan struct{}
	wg        sync.WaitGroup
	replays   sync.Map
	documents sync.Map
	blocked   sync.Map
}

func NewCrawler(browser *rod.Browser, limit int) *Crawler {
	go p.BrowserSetDownloadBehavior{Behavior: p.BrowserSetDownloadBehaviorBehaviorDeny}.Call(browser)

	crawler := &Crawler{
		browser: browser,
		limit:   make(chan struct{}, limit),
	}

	go browser.EachEvent(func(e *p.FetchRequestPaused) {
		id := e.RequestID
		req := Request{
			Type:     e.ResourceType,
			URL:      e.Request.URL,
			Method:   e.Request.Method,
			PostData: e.Request.PostData,
		}
		if e.ResourceType != p.NetworkResourceTypeDocument {
			go p.FetchContinueRequest{RequestID: id}.Call(browser)
		} else if replay, ok := crawler.replay(e.FrameID); ok {
			go replay.continueRequest(id).Call(browser)
			log.Println("[INFO] ", "Replay | Frame:", string(e.FrameID)[:6], replay)
			return
		} else {
			go p.FetchFailRequest{RequestID: id, ErrorReason: p.NetworkErrorReasonAborted}.Call(browser)
			crawler.Feed(&req)
		}
	})()

	return crawler
}

func (c *Crawler) Wait() {
	c.wg.Wait()
}

func (c *Crawler) Allow(host string) {
	log.Println("[INFO] ", "Allow | host:", host)
	c.allow = append(c.allow, host)
}

func (c *Crawler) Feed(r *Request) {
	match := func(patterns []string, host string) bool {
		for _, pattern := range patterns {
			if strings.HasSuffix(host, pattern) {
				return true
			}
		}
		return false
	}
	url, err := url.Parse(r.URL)
	if err != nil {
		log.Println("[WARN] ", "Feed | Invalid:", r.URL)
		return
	}
	if !match(c.allow, url.Host) {
		c.blocked.Store(r.URL, struct{}{})
		return
	}
	url.ForceQuery = false
	r.URL = url.String()
	if _, ok := c.documents.LoadOrStore(*r, struct{}{}); ok {
		return
	}

	log.Println("[INFO] ", "Feed | URL:", r.URL)
	c.wg.Add(1)
	go c.worker(r)
}

func (c *Crawler) replay(id p.PageFrameID) (*Request, bool) {
	r, ok := c.replays.LoadAndDelete(id)
	request, _ := r.(*Request)
	return request, ok
}

func (c *Crawler) worker(r *Request) {
	c.limit <- struct{}{}
	defer func() {
		<-c.limit
		c.wg.Done()
	}()
	page := c.browser.MustPage("")
	defer page.Close()
	p.NetworkEnable{}.Call(page)
	c.replays.Store(page.FrameID, r)

	analyzer := &DemoAnalyzer{}
	analyzer.Analyze(page, r.URL)
}
