int main() {
    int a = 0;
    a || (a = 3) || (a = 4);
    return a;
}
// Example files from https://github.com/nlsandler/write_a_c_compiler
