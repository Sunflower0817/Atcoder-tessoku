#include <iostream>
#include <fstream>
#include <chrono>
using namespace std;

int H, W;
int X[1509][1509];
int Q;
int A[1509], B[1509], C[1509], D[1509];
// int Ss[1509][1509] = {0};
int S[1509][1509] = {0};

int main() {
    std::ifstream in("data/input.txt");
    std::ofstream out("data/output.txt");
    std::ofstream log("data/log.txt");
    auto start = std::chrono::high_resolution_clock::now();

    std::cin.rdbuf(in.rdbuf());
    std::cout.rdbuf(out.rdbuf());

    cin >> H >> W;
    for (int i=1; i<=H; ++i){
        for (int j=1; j<=W; ++j){
            cin >> X[i][j];
        }
    }
    cin >> Q;
    for (int i=1; i<=Q; ++i){
        cin >> A[i] >> B[i] >> C[i] >> D[i];
    }
    // for (int i=1; i<=H; ++i){
    //     for (int j=1; j<=W; j++){
    //         Ss[i][j]=Ss[i][j-1]+X[i][j];
    //     }
    // }
    // for (int i=1; i<=H; i++){
    //     for (int j=1; j<=W; j++){
    //         S[i][j]=S[i-1][j]+Ss[i][j];
    //     }
    // }
    for (int i=1; i<=H; ++i){
        for (int j=1; j<=W; j++){ S[i][j]=S[i][j-1]+X[i][j];}
    }
    for (int j=1; j<=W; ++j){
        for (int i=1; i<=H; i++){ S[i][j]=S[i-1][j]+S[i][j];}
    }
    for (int i=1; i<=Q; i++){
        int ans = S[C[i]][D[i]] - S[A[i]-1][D[i]] - S[C[i]][B[i]-1] + S[A[i]-1][B[i]-1];
        cout << ans << endl;
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> elapsed = end - start;
    log << "処理時間: " << elapsed.count() << " 秒" << std::endl;
    return 0;
}