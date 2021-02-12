from google.appengine.ext import ndb
import webapp2
import json

class Plan(ndb.Model):
    owner = ndb.StringProperty()
    name = ndb.StringProperty()
    data = ndb.TextProperty()

class ListPlans(webapp2.RequestHandler):
    def get(self, owner):
        plans = [{'name':p.name, 'key':p.key.urlsafe()} for p in Plan.query(Plan.owner == owner)]
        self.response.headers['Content-type'] = 'application/json'
        resp = {'planlist' : plans}
        return self.response.write(json.dumps(resp))

class LoadPlan(webapp2.RequestHandler):
    def get(self):
        plankey = self.request.GET['plan']
        self.response.headers['Content-type'] = 'application/json'
        plan = ndb.Key(urlsafe=plankey).get()
        resp = {'plan' : plan.data, 'planname' : plan.name, 'key': plankey}
        return self.response.write(json.dumps(resp))

class SavePlan(webapp2.RequestHandler):
    def post(self):
        params = json.loads(self.request.body)
        owner = params['owner']
        planname = params['planname']
        data = json.dumps(params['data'])

        plan = Plan(owner=owner, name=planname, data=data)
        key = plan.put()
        resp = {'plankey' : key.urlsafe()}
        return webapp2.Response(json.dumps(resp))

class UpdatePlan(webapp2.RequestHandler):
    def post(self):
        params = json.loads(self.request.body)
        plankey = params['plankey']
        data = json.dumps(params['data'])

        plan = ndb.Key(urlsafe=plankey).get()
        plan.data = data
        plan.put()
        resp = {'plankey' : plankey}
        return webapp2.Response(json.dumps(resp))

routes = [
    (r'/list/(.+)$', ListPlans),
    (r'/load$', LoadPlan),
    (r'/save$', SavePlan),
    (r'/update$', UpdatePlan),
]
    
app = webapp2.WSGIApplication(routes, debug=True)
