package com.muicochay.mory.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChangePasswordRequest {
<<<<<<< HEAD

=======
>>>>>>> 5e2b780400989663f53519c44db549a553a43b1c
    @NotBlank
    private String currentPassword;
    @NotBlank
    private String newPassword;
}
