import sqlite3, json, sys
db=sqlite3.connect(sys.argv[1])
db.row_factory=sqlite3.Row
request=json.load(sys.stdin)
try:
    results=[]
    with db:
        for q in request:
            cur=db.execute(q['sql'],q.get('args',[]))
            rows=[dict(r) for r in cur.fetchall()]
            results.append({'results':rows,'meta':{'changes':max(cur.rowcount,0)}})
    print(json.dumps(results))
except Exception as e:
    print(json.dumps({'error':str(e)}))
    sys.exit(1)
