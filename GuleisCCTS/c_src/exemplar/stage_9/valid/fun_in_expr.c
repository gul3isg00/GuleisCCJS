int sum(int a, int b) {
    return a + b;
}

int main() {
    int a = sum(1, 2) - (sum(1, 2) / 2) * 2;
    int b = 2*sum(3, 4) + sum(1, 2);
    return b - a;
}
// Example files from https://github.com/nlsandler/write_a_c_compiler
