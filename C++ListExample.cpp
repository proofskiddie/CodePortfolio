#include <iostream>

template <class T>
abstract class List {};

template <class T>
class Nil : public List<T> {};

template <class T>
class Cons : public List<T> {
public :
  T head;
  List<T> tail;
  Cons<T>(T _h, List<T> _t) : head(_h), tail(_t) {}
  Cons<T>(T _h) : head(_h), tail(Nil<T>()) {}
};

template <class T>
List<T> operator+(T _h, List<T> _t) {
  return Cons<T>(_h, _t);
}

template <class T>  
List<T> operator++ (List<T> list1, List<T> list2) {
  if (list1 == Nil<T>()) return list2;
    return Cons<T>(list1.head, operator++(list1.tail, list2));
}

int main() {
  List<int> list = 1 + (2 + (3 + Nil<int>()));
  return 0;
}
