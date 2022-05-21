package main

import (
	_ "embed"
	"log"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/proto"
)

//go:embed inject/demo.js
var DemoScript string

//go:embed inject/css.js
var CssPathScript string

type DemoAnalyzer struct {
}

func (a *DemoAnalyzer) Analyze(page *rod.Page, url string) {
	page.EvalOnNewDocument(FillerScript)
	page.EvalOnNewDocument(CssPathScript)
	proto.PageAddScriptToEvaluateOnNewDocument{
		Source:                DemoScript,
		IncludeCommandLineAPI: true,
	}.Call(page)

	if err := page.Navigate(url); err != nil {
		log.Println("[ERROR]", "Navigate | Failed:", err)
		return
	}
	page.MustWaitLoad()

	proto.RuntimeEvaluate{
		Expression:            "analyzer.analyze(0)",
		AwaitPromise:          true,
		IncludeCommandLineAPI: true,
	}.Call(page)
}
