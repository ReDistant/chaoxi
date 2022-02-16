import sys
sys.path.append('/usr/local/lib/python3.6/site-packages')
from Wappalyzer import Wappalyzer, WebPage

url = sys.argv[1]
w = Wappalyzer.latest()
webpage = WebPage.new_from_url(url)
data = w.analyze_with_versions_and_categories(webpage)
print(data)
