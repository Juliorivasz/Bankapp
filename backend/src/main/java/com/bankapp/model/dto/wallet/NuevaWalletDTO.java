package com.bankapp.model.dto.wallet;

import lombok.Data;
import lombok.NonNull;

@Data
public class NuevaWalletDTO {

    @NonNull
    private String simboloMoneda;
}