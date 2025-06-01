import json, random
data = json.load(open('data/data.json'))
random.shuffle(data)
json.dump(data, open('data/data.json', 'w'), indent=2)