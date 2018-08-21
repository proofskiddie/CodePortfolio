// functional style implementation of quicksort in JAVA
class Recursive {
    // feel free to use this function to test lt and gteq
    Links<Integer> quicksort(Links<Integer> list) {
        if (list.getNext() == null) {
            return new Nil<Integer>();
        } else {
            return append(quicksort(lt(list.getElem(), list.getNext())), 
			  new Cons<Integer> (list.getElem(), 
		          quicksort(gteq(list.getElem(), list.getNext()))));
        }
    }

    Links<Integer> append(Links<Integer> listA, Links<Integer> listB) {
	if (listA.getNext() == null) return listB;
	else return new Cons<Integer>(listA.getElem(), append(listA.getNext(), listB));
    }

    // return all elements of a list less than n
    Links<Integer> lt(int n, Links<Integer> list) {
	if (list.getNext() == null) {
		return new Nil<Integer>();
	} else {
		if (list.getElem() < n) 
			return new Cons<Integer>(list.getElem(), lt(n, list.getNext()));
		else 
			return lt(n, list.getNext());
	}
    }

    // return all elements of a list greater than or equal to n
    Links<Integer> gteq(int n, Links<Integer> list) {
	if (list.getNext() == null) {
		return new Nil<Integer>();
	} else {
		if (list.getElem() >= n) 
			return new Cons<Integer>(list.getElem(), gteq(n, list.getNext()));
		else 
			return gteq(n, list.getNext());
	}
    }

}

/*****************************/
// links implementation 
/*****************************/
abstract class Links<AType> {
	abstract AType getElem();
	abstract Links<AType> getNext();
}

class Cons<AType> extends Links<AType> {
	AType elem;
	Links<AType> next;
	Cons(AType _elem, Links<AType> _next) {
		elem = _elem;
		next = _next;
	}
	AType getElem(){ return elem; }
	Links<AType> getNext(){ return next; } 
}

class Nil<AType> extends Links<AType> {
	Nil(){}
	AType getElem() { return null; }
	Links<AType> getNext() { return null; }
}
/*****************************/
