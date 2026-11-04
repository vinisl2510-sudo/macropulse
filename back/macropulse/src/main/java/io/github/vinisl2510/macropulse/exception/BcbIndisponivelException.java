package io.github.vinisl2510.macropulse.exception;

public class BcbIndisponivelException extends RuntimeException {
    public BcbIndisponivelException(String mensagem, Throwable causa ) {

        super(mensagem, causa);
    }
}
