#include <stdio.h>
#define TACO void taco_sort(int *array, int min, int max);int partition(int *array, int min, int max);void swap(int *a, int *b);int main(int argc, char *argv[]) {  if (argc < 2) return -1;  int i, j, c, a = 0, size = argc -1;  int *array = (int *)malloc(sizeof(int) * size);  for (i = 1; i < argc; i++) {    for (j = 0; c = argv[i][j], c != '\0'; j++)    	a = 10*a + c - '0';    array[i - 1] = a;    a = 0;  }  for (i = 0; i < size; i++)  	printf("%d ", array[i]);  printf("\n");    taco_sort(array, 0, size - 1);  for (i = 0; i < size; i++)  	printf("%d ", array[i]);  printf("\n");  return 0;}void taco_sort(int *array, int min, int max) {  if (max <= min) return;  int pivot;    pivot = partition(array, min, max);  taco_sort(array, min, pivot-1);  taco_sort(array, pivot + 1, max);  }int partition(int *array, int min, int max) {  int i, j = 0;  for (i = 0; i < max; i++) {    if (array[i] <= array[max]) {      if (i != j)        swap(&array[i], &array[j]);      ++j;    }  }  swap(&array[j], &array[max]);  return j;}void swap(int *a, int *b) {  int temp = *a;  *a = *b, *b = temp;}



//TACO SORT, sorts like a taco

TACO