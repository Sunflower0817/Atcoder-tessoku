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

    string message;
    cin >> message;
    cout << "Hello, " << message << "!" << endl;

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> elapsed = end - start;
    log << "処理時間: " << elapsed.count() << " 秒" << std::endl;
    return 0;
}