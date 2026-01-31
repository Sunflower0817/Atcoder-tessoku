#include <iostream>
#include <fstream>
#include <chrono>
using namespace std;

int main() {
    std::ifstream in("data/input.txt");
    std::ofstream out("data/output.txt");
    std::ofstream log("data/log.txt");
    auto start = std::chrono::high_resolution_clock::now();

    std::cin.rdbuf(in.rdbuf());
    std::cout.rdbuf(out.rdbuf());

    int N, Q;
    cin >> N >> Q;
    int A[100000];
    for (int i = 0; i < N; ++i) {cin >> A[i];}
    int sum[N];
    sum[0] = A[0];
    for (int i = 1; i < N; ++i){
        sum[i] = sum[i - 1] + A[i];
    }
    int L[Q], R[Q];
    for (int i = 0; i < Q; ++i){
        cin >> L[i] >> R[i];
    }
    for (int i = 0; i < Q; ++i){
        int psum = 0;
        if (L[i] == 1) {
            psum = sum[R[i]-1];
        } else {
            psum = sum[R[i]-1] - sum[L[i] - 2];
        }
        cout << psum << endl;
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> elapsed = end - start;
    log << "処理時間: " << elapsed.count() << " 秒" << std::endl;
    return 0;
}