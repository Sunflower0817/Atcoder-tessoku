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

    int D,N;
    cin >> D;
    cin >> N;
    int L[100009], R[100009];
    int sum[100009] = {0};
    for (int i = 1; i <= N; ++i) {
        cin >> L[i] >> R[i];
    }
    for (int i = 1; i <= N; i++){
        sum[L[i]] += 1;
        sum[R[i]+1] -= 1;
    }
    int part[100009] = {0};
    for (int i = 1; i <= D; i++){
        part[i] = part[i - 1] + sum[i];
    }
    for (int i = 1; i <= D; i++){
        cout << part[i] << endl;
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> elapsed = end - start;
    log << "処理時間: " << elapsed.count() << " 秒" << std::endl;
    return 0;
}