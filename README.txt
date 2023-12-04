pentru pornirea serverului am folosit in terminal "node server.js" fiind in directorul backend
pentru pornirea mongo am folosit in terminal "mongosh" iar dupa deschidere am scris "use pollit" - nu sunt sigur ca chestiile astea au vreun gram de portabilitate... it works on my machine :D

pana acum:
	-functiile de register si login functioneaza
	-parolele sunt hashuite cu bcrypt
	-am rezolvat logout-ul in momentul refresh-ului, sesiunea ramane acuma activa pana la apasarea butonului de logout
	-la apasarea logoului se da refresh paginii
	-footer-ul si linkurile catre social media functioneaza
	-ar trebui sa functioneze si scalarea paginii in functie de dimensiunea ecranului sau tabului
	-createpoll popup are o forma relativ decenta, nu tocmai conform figma
	-poll-urile sunt create

in lucru:
	-ne confruntam cu un mic overflow de la polluri
	-stilizarea chenarelor de poll

vor urma:
	-sistemul de vot	