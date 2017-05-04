import os
import re
import sys
import glob
import zipfile

if(len(sys.argv) != 3): 
    print('usage: ', os.path.basename(sys.argv[0]), ' <zip file> <regular expression>')
    exit()

zip = zipfile.ZipFile(sys.argv[1])
if(not zip):
    print('Could not open the zip file ', sys.argv[1])
    exit()

pattern = re.compile(sys.argv[2])

for zinfo in zip.infolist():
    if(pattern.match(os.path.basename(zinfo.filename))): zip.extract(zinfo,os.getcwd()+'\\result3')