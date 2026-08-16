//! Módulo WebAssembly de referência do Meta Platform.
//!
//! A superfície é deliberadamente mínima, mas cobre os TRÊS pontos que qualquer
//! `.wasmlib` de verdade vai precisar:
//!
//! 1. chamar uma função e receber um escalar de volta (`add`);
//! 2. o protocolo de memória — reservar um bloco, deixar o JavaScript escrever
//!    nele e devolvê-lo (`alloc` / `dealloc`);
//! 3. um laço numérico sobre esse bloco (`sum_f32`, `scale_f32`), que é
//!    exatamente a forma do trabalho que se quer tirar do JavaScript.
//!
//! Compilado para `wasm32-unknown-unknown`: sem WASI, sem sistema operacional.
//! O módulo exporta a própria memória linear, e é por isso que o manifesto do
//! pacote NÃO declara a seção `memory`.

use std::alloc::{alloc as raw_alloc, dealloc as raw_dealloc, Layout};

/// Alinhamento do bloco devolvido por `alloc`. 8 bytes cobre `f64` e qualquer
/// coisa menor, que é todo tipo numérico que atravessa a fronteira hoje.
const ALIGNMENT: usize = 8;

/// Soma de dois inteiros — a chamada mais simples que existe, presente só para
/// provar que o módulo carregou e responde.
#[no_mangle]
pub extern "C" fn add(left: i32, right: i32) -> i32 {
    left.wrapping_add(right)
}

/// Reserva `size` bytes na memória linear e devolve o deslocamento.
///
/// Este é o único caminho honesto para passar um array ao módulo: WebAssembly
/// não recebe objetos, só números. O JavaScript pede o bloco, escreve nele
/// através de um `Float32Array` sobre `memory.buffer` e passa o deslocamento.
///
/// # Safety
/// O ponteiro devolvido pertence a quem chamou até ele passá-lo de volta para
/// `dealloc` com o MESMO `size`. Um `size` diferente na devolução corrompe o
/// alocador — é a mesma regra de `alloc`/`free` em C.
#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut u8 {
    if size == 0 {
        return std::ptr::null_mut();
    }
    // `unwrap` aqui é intencional: um layout inválido significa um `size`
    // absurdo vindo do chamador, e seguir com ponteiro nulo só adiaria a falha
    // para dentro do laço, onde ela não teria explicação.
    let layout = Layout::from_size_align(size, ALIGNMENT).unwrap();
    unsafe { raw_alloc(layout) }
}

/// Devolve ao alocador um bloco obtido em `alloc`.
///
/// # Safety
/// `ptr` tem de ter vindo de `alloc` e `size` tem de ser o mesmo usado lá.
#[no_mangle]
pub unsafe extern "C" fn dealloc(ptr: *mut u8, size: usize) {
    if ptr.is_null() || size == 0 {
        return;
    }
    let layout = Layout::from_size_align(size, ALIGNMENT).unwrap();
    unsafe { raw_dealloc(ptr, layout) }
}

/// Soma `len` floats a partir de `ptr`.
///
/// O acumulador é `f64` de propósito: somar milhões de `f32` num acumulador
/// `f32` perde precisão progressivamente, porque cada parcela nova fica pequena
/// demais frente ao total acumulado.
///
/// # Safety
/// `ptr` tem de apontar para `len` floats válidos dentro da memória linear.
#[no_mangle]
pub unsafe extern "C" fn sum_f32(ptr: *const f32, len: usize) -> f64 {
    if ptr.is_null() || len == 0 {
        return 0.0;
    }
    let values = unsafe { std::slice::from_raw_parts(ptr, len) };
    values.iter().fold(0.0_f64, |total, value| total + *value as f64)
}

/// Multiplica `len` floats por `factor`, no lugar.
///
/// Escrever de volta no MESMO bloco é o padrão que interessa: o resultado já
/// está onde o JavaScript vai lê-lo, sem cópia de saída. É a forma de uma
/// transformação de geometria — aplicar uma matriz, normalizar, pintar vértices.
///
/// # Safety
/// `ptr` tem de apontar para `len` floats válidos dentro da memória linear.
#[no_mangle]
pub unsafe extern "C" fn scale_f32(ptr: *mut f32, len: usize, factor: f32) {
    if ptr.is_null() || len == 0 {
        return;
    }
    let values = unsafe { std::slice::from_raw_parts_mut(ptr, len) };
    for value in values.iter_mut() {
        *value *= factor;
    }
}
