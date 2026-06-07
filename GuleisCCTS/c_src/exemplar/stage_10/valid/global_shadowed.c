int a = 3;

int main() {
    int ret = 0;
    if (a) {
        int a = 0;
        ret = 4;
    }
    return ret;
}
// Example files from https://github.com/nlsandler/write_a_c_compiler
