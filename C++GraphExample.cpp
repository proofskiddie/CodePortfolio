#include "graph.h"

const Graph* p_graph;
float* wts;
int* st;

bool Graph::readfile(std::string f1, std::string f2) {
	std::ifstream f1s(f1);
	if (!f1s) {
		std::cout << f1 << " file invalid\n";
		return false;
	}
	int e, n1, n2;
	float wt;
	bool isDijkstra = (f2 == "");
	while(f1s.good()) {
		if ((f1s >> e >> n1 >> n2 >> wt)) {
			if (e < 0 || n1 < 0 || n2 < 0 || wt < 0)
				f1s.setstate(std::ios::failbit);
			else {
				addedge(e,n1,n2,wt);
				if (isDijkstra) {
					setcoords(n1,0,0);
					setcoords(n2,0,0);
				}
			}
		} else
			f1s.setstate(std::ios::failbit);
	}
	if (!f1s.eof()) {
		std::cout << f1 << " file invalid\n";
		return false;	
	}
	if (isDijkstra) 
		return true;
	std::ifstream f2s(f2);
	if (!f2s) {
		std::cout << f2 << " file invalid\n";
		return false;
	}
	float x, y;
	while (f2s.good()) {
		if ((f2s >> n1 >> x >> y)) {
			setcoords(n1, x, y);
		} else
			f2s.setstate(std::ios::failbit);
	}
	if (coords.size() != V) {
		std::cout << "error: 1 or more nodes without coordinates\n";
		return false;
	}
	if (!f2s.eof()) {
		std::cout << f2 << " file invalid\n";
		return false;	
	}
	return true;
}

void Graph::setcoords(int n, float x, float y) {
	coords[n] = std::pair<float,float>(x,y);	
}

const std::pair<float,float>& Graph::getcoords(int n) const {
	return coords.at(n);
}
int Graph::geteid(int n1, int n2) const {
	std::pair<int,int> t(n1,n2);
	if (emap.find(t) == emap.end()) return -1;
	return emap.at(t);
}
void Graph::addedge(int e, int n1, int n2, float wt) {
	if (!isnode(n1)) addnode(n1);
	if (!isnode(n2)) addnode(n2);
	putedge(n1, n2, e, wt);
	putedge(n2, n1, e, wt);
	unite(getindex(n1),getindex(n2));
}

void Graph::putedge(int list, int dest, int eid, float wt) {
	int index = nmap[list];
	emap[std::pair<int,int>(list,dest)] = eid;
	auto node = new AdjNode(dest, wt);
	if (array[index].head != nullptr) {
		node->next = array[index].head;				
	}	
	array[index].head = node;
}

const AdjList& Graph::getnode(int n) const {
	return array[nmap.at(n)]; 
}

const AdjList& Graph::getatindex(int n) const {
	return array[n]; 
}

void Graph::addnode(int n) {
	nmap.insert(std::pair<int,int>(n,V++));
	array.push_back(AdjList(n));
	conn[n] = n;
	c_sz[n] = 1;
}

//-- methods to implement quick union for connectivity checking
int Graph::root(int i) const {
	while (i != conn.at(i)) {
		i = conn.at(i);
	}
	return i;
}

int Graph::rootmake(int i) {
	while (i != conn[i]) {
		conn[i] = conn.at(conn.at(i));
		i = conn.at(i);
	}
	return i;
}

void Graph::unite(int n1, int n2) {
	int r1, r2;
	r1 = rootmake(n1);
	r2 = rootmake(n2);
	if (c_sz.at(r1) < c_sz.at(r2)) {
		conn[r1] = r2;
		c_sz[r2] += c_sz[r1];
	} else {
		conn[r2] = r1;
		c_sz[r1] += c_sz[r2];
	}
}

bool Graph::isconn(int n1, int n2) const{
	if (!isnode(n1) || !isnode(n2)) return false;
	return root(getindex(n1)) == root(getindex(n2));
}
//--

int Graph::getindex(int n) const {
	return nmap.at(n);
}

bool Graph::isnode(int n) const {
	return (nmap.find(n) != nmap.end());
}

void Graph::print() {
	for (auto it = array.begin(); it != array.end(); ++it) {
		std::cout << it->nid;
		for (AdjNode* p = it->head; p != nullptr; p = p->next) {
			std::cout << " -> " << p->nid;
		}
		std::cout << std::endl;
	}
}
