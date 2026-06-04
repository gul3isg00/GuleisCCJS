int main() {
    int a = 1;

    while (a / 3 < 20) {
        int b = 1;
        while (b < 10)
            b = b*2;
        a = a + b;
    }

    return a;
}
// Example files from https://github.com/nlsandler/write_a_c_compiler
