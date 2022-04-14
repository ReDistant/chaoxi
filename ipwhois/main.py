import sys
sys.path.append('/usr/local/lib/python3.6/site-packages')
from ipwhois import IPWhois
import json

ip = sys.argv[1]
obj = IPWhois(ip)
data = obj.lookup_rdap(depth=1)
with open('out.json', 'w') as f:
    f.write(json.dumps(data))
print(data)
