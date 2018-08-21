import socket
import thread
from os.path import isfile, realpath, join, exists
from os import chdir
from sys import argv

HOST = socket.gethostname() 
PORT = int(argv[1])
NOTFOUND = '404 Not Found\r\n'

def handle_connection(conn, addr):
    try:
    	data = conn.recv(4096)
	msg = data.split('\r\n')[0].split(' ')
	method = msg[0]
	rfile  = msg[1]
	if rfile == '/': rfile = 'index.html'
	if rfile[0] == '/': rfile = rfile[1:]
	hver   = msg[2]
	if ((method == 'GET') & (hver == 'HTTP/1.1')) :
		fp = open(realpath(rfile), "r")
		fread = fp.read()
        	conn.sendto('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n'.encode(), addr)
        	conn.sendto(fread.encode(), addr)
    except Exception as e : 
	print e
	conn.sendto(NOTFOUND.encode(), addr)
    conn.close()
    return

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))

if not exists('Uploads'): mkdir('Uploads')
chdir('Uploads')
try:
	while 1:
		s.listen(1)
		conn, addr = s.accept()
		thread.start_new_thread(handle_connection, (conn, addr,))
except KeyboardInterrupt :
	s.close() 
	exit(0)

		
	

