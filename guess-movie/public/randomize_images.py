import json, random
data = json.load(open('data/data2.json'))
random.shuffle(data)
json.dump(data, open('data/data2.json', 'w'), indent=2)