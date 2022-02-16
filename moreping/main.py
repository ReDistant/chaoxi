import re
import requests
import json
import time
import sys

def get_nodes(host):
    req_url = 'https://wepcc.com:443/'
    req_headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    param_body = {
        "host": host,
        "node": "1,2,3,4,5,6,7,8"
    }
    node_pat = re.compile(r'data-id="(\w+?)"')
    addr_pat = re.compile(r'<td>([\s\w\(\)-]+)</td>')
    pat = re.compile(r'data-id="(\w+?)">\n.*<td>([\s\w\(\)-]+)</td>')

    try:
        req = requests.post(url=req_url, headers=req_headers, data=param_body)
        if req.status_code == 200:
            return pat.findall(req.text)
        else:
            print(f"get_nodes Error:{status_code}")
    except Exception as e:
        print(e)
    return []


def get_ping(node, host):
    req_url = 'https://wepcc.com:443/check-ping.html'
    req_headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    param_body = 'node={n}&host={h}'.format(n=node, h=host)

    try:
        req = requests.post(url=req_url, data=param_body, headers=req_headers)
        if req.status_code == 200:
            try:
                json_data = json.loads(req.content)
                return json_data
            except Exception as e:
                print('[Error Gevent Worker Parse {host} Json]: {error}'.format(host=host, error=e))
        else:
            print(req.status_code)
    except Exception as e:
        print('[Main Error Gevent Worker]: {}'.format(e))
        time.sleep(0.5)

if __name__ == '__main__':
    target = sys.argv[1]
    data = get_nodes(target)
    result = {'target': target, 'data':[]}
    for (node, addr) in data:
        data = get_ping(node, target)['data']
        # handle timeout character
        pat = re.compile(r'>(\w.)<')
        if 'font' in data['Ttl']:
            temp = pat.findall(data['Ttl'])
            data['Ttl'] = temp[0]
        if 'font' in data['Time']:
            temp = pat.findall(data['Time'])
            data['Time'] = temp[0]
        data['addr'] = addr
        result['data'].append(data)
    print(result)
