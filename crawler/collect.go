package main

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"log"

	"github.com/go-rod/rod"
	p "github.com/go-rod/rod/lib/proto"
)

type RequestSent struct {
	DocumentURL      string                `json:"documentURL"`
	Request          *p.NetworkRequest     `json:"request"`
	Initiator        *p.NetworkInitiator   `json:"initiator"`
	RedirectResponse *p.NetworkResponse    `json:"redirectResponse,omitempty"`
	Type             p.NetworkResourceType `json:"type,omitempty"`
	Sha256           string                `json:"sha256"`
	Status           int                   `json:"status"`
}

type Collector struct {
	loading  map[p.NetworkRequestID]*RequestSent
	Finished []*RequestSent
}

func NewCollector() Collector {
	return Collector{
		loading:  make(map[p.NetworkRequestID]*RequestSent),
		Finished: make([]*RequestSent, 0),
	}
}

type Client struct {
	browser   *rod.Browser
	sessionID p.TargetSessionID
}

func (c *Client) GetSessionID() p.TargetSessionID {
	return c.sessionID
}

func (c *Client) Call(ctx context.Context, sessionID, methodName string, params interface{}) (res []byte, err error) {
	return c.browser.Call(ctx, sessionID, methodName, params)
}

func (c *Collector) get(id p.NetworkRequestID) *RequestSent {
	r, ok := c.loading[id]
	if !ok {
		r = &RequestSent{}
		c.loading[id] = r
	}
	return r
}

func (c *Collector) collect(browser *rod.Browser) {
	browser.EachEvent(func(e *p.NetworkRequestWillBeSent) {
		r := c.get(e.RequestID)
		r.DocumentURL = e.DocumentURL
		r.Request = e.Request
		r.Initiator = e.Initiator
		r.RedirectResponse = e.RedirectResponse
		r.Type = e.Type
	}, func(e *p.NetworkResponseReceived) {
		r := c.get(e.RequestID)
		r.Status = e.Response.Status
	}, func(e *p.NetworkLoadingFinished, sessionID p.TargetSessionID) {
		go func() {
			r := c.get(e.RequestID)
			client := Client{browser: browser, sessionID: sessionID}
			body, err := p.NetworkGetResponseBody{RequestID: e.RequestID}.Call(&client)
			if err != nil {
				log.Println(err)
				return
			}
			var data []byte
			if body.Base64Encoded {
				data, _ = base64.StdEncoding.DecodeString(body.Body)
			} else {
				data = []byte(body.Body)
			}
			hash := sha256.Sum256(data)

			r.Sha256 = hex.EncodeToString(hash[:])
			c.Finished = append(c.Finished, r)
		}()
	})()
}
