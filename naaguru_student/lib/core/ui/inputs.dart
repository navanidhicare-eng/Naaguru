import 'package:flutter/material.dart';
import '../theme.dart';

class NaaguruTextField extends StatelessWidget {
  final String? label;
  final String? hintText;
  final String? errorText;
  final bool enabled;
  final bool obscureText;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final void Function(String)? onChanged;
  final String? Function(String?)? validator;

  const NaaguruTextField({
    super.key,
    this.label,
    this.hintText,
    this.errorText,
    this.enabled = true,
    this.obscureText = false,
    this.controller,
    this.keyboardType,
    this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: NaaguruTheme.text,
            ),
          ),
          const SizedBox(height: NaaguruTheme.spacing8),
        ],
        TextFormField(
          controller: controller,
          enabled: enabled,
          obscureText: obscureText,
          keyboardType: keyboardType,
          onChanged: onChanged,
          validator: validator,
          style: TextStyle(
            fontSize: 16,
            color: enabled ? NaaguruTheme.text : NaaguruTheme.muted,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            errorText: errorText,
            hintStyle: const TextStyle(color: NaaguruTheme.muted),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: NaaguruTheme.spacing16,
              vertical: NaaguruTheme.spacing16,
            ), // Min touch target > 48px
            filled: true,
            fillColor: enabled ? NaaguruTheme.surface : NaaguruTheme.background,
            border: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.muted),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.muted),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.error, width: 2),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: BorderSide(color: NaaguruTheme.muted.withAlpha(128)),
            ),
          ),
        ),
      ],
    );
  }
}

class NaaguruDropdownField<T> extends StatelessWidget {
  final String? label;
  final String? hintText;
  final String? errorText;
  final bool enabled;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final void Function(T?)? onChanged;
  final String? Function(T?)? validator;

  const NaaguruDropdownField({
    super.key,
    this.label,
    this.hintText,
    this.errorText,
    this.enabled = true,
    required this.value,
    required this.items,
    required this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveValue = (value != null && items.any((item) => item.value == value))
        ? value
        : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: NaaguruTheme.text,
            ),
          ),
          const SizedBox(height: NaaguruTheme.spacing8),
        ],
        DropdownButtonFormField<T>(
          key: ValueKey(effectiveValue),
          initialValue: effectiveValue,
          items: items,
          onChanged: enabled ? onChanged : null,
          validator: validator,
          style: TextStyle(
            fontSize: 16,
            color: enabled ? NaaguruTheme.text : NaaguruTheme.muted,
            fontFamily: 'Inter',
          ),
          icon: const Icon(Icons.keyboard_arrow_down, color: NaaguruTheme.muted),
          decoration: InputDecoration(
            hintText: hintText,
            errorText: errorText,
            hintStyle: const TextStyle(color: NaaguruTheme.muted),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: NaaguruTheme.spacing16,
              vertical: NaaguruTheme.spacing16,
            ),
            filled: true,
            fillColor: enabled ? NaaguruTheme.surface : NaaguruTheme.background,
            border: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.muted),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.muted),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: const BorderSide(color: NaaguruTheme.error, width: 2),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: NaaguruTheme.borderRadius,
              borderSide: BorderSide(color: NaaguruTheme.muted.withAlpha(128)),
            ),
          ),
        ),
      ],
    );
  }
}

