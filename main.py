from google.cloud import ndb
from flask import Flask, request
import json


class Plan(ndb.Model):
    name = ndb.StringProperty()
    data = ndb.TextProperty()


client = ndb.Client()


# Middleware to obtain new client context for each request. This code borrowed from Google
# at https://cloud.google.com/appengine/docs/standard/python3/migrating-to-cloud-ndb
def ndb_wsgi_middleware(wsgi_app):
    def middleware(environ, start_response):
        with client.context():
            return wsgi_app(environ, start_response)

    return middleware


app = Flask(__name__)
# Wrap app in middleware
app.wsgi_app = ndb_wsgi_middleware(app.wsgi_app)


@app.route('/list/')
def list_plans():
    return {'planlist': [{'name': p.name, 'key': p.key.urlsafe()} for p in Plan.query()]}


@app.route('/load/')
def load_plan():
    plankey = request.args.get('plan')
    plan = ndb.Key(urlsafe=plankey).get()

    # TODO: Add error handling for bad plankey
    return {'plan': plan.data, 'planname': plan.name, 'key': plankey}


@app.route('/save/', methods=['POST'])
def save_plan():
    params = request.get_json(force=True)
    planname = params['planname']
    data = json.dumps(params['data'])

    plan = Plan(name=planname, data=data)
    key = plan.put()
    return {'plankey' : key.urlsafe()}

@app.route('/update/', methods=['POST'])
def update_plan():
    params = request.get_json(force=True)
    plankey = params['plankey']
    data = json.dumps(params['data'])

    plan = ndb.Key(urlsafe=plankey).get()
    plan.data = data
    plan.put()
    return {'plankey' : plankey}
