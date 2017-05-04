import os
import sys
import glob
import sqlite3
import zipfile

if(len(sys.argv) < 3): 
    print('usage: ', os.path.basename(sys.argv[0]), ' <db> <extension> [<extension> ...]')
    exit()

out_ext = '.zip'
conn = sqlite3.connect(sys.argv[1])
cur = conn.cursor()

index = 2
while(index < len(sys.argv)):
    zip = zipfile.ZipFile(sys.argv[index] + out_ext,'w',compression=zipfile.ZIP_STORED)
    res = cur.execute('select * from files where ext = \'' + sys.argv[index] + '\'') 

    for row in res:
        if row: 
            try: zip.write(os.path.join(row[1],row[2]))
            except: pass

    zip.close()
    index += 1