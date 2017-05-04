import os
import glob
import sys
import sqlite3 
from table import *

out_file = 'result1.txt'

if(len(sys.argv) != 2): 
    print('usage: ', os.path.basename(sys.argv[0]), ' <directory>')
    exit()

conn = sqlite3.connect('filesdb')
cur = conn.cursor()

try: cur.execute('drop table files')
except: pass
cur.execute('create table files (ext,path,fname)') 

for root, dirs, files in os.walk(os.getcwd() + '\\' + sys.argv[1], topdown=False):
    for name in files:
        if name[:1] == '.': continue
        file_ext = (os.path.splitext(os.path.abspath(name))[1][1:])
        file_ext = None if len(file_ext) == 0 else file_ext
        cur.execute('insert into files values (?,?,?)',(file_ext, root, name))

with open(out_file,'w') as file:
    res = cur.execute('select * from files') 
    for fieldinfo in res.description: 
        file.write(fieldinfo[0] + ' ') 
    file.write('\n')
    for row in res:
        if row: 
            try: file.write(' '.join(row) + '\n')
            except:
                for elm in row:
                    if elm: file.write(elm + ' ')
                    else: file.write('None ')
                file.write('\n')

conn.commit() 
conn.close()