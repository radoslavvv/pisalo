using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TyperacerAPI.Entities;

namespace TyperacerAPI.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .HasMaxLength(256);

        builder.Property(u => u.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(u => u.OAuthProvider)
            .HasMaxLength(20);

        builder.Property(u => u.OAuthId)
            .HasMaxLength(100);

        builder.HasIndex(u => u.Username)
            .IsUnique();

        builder.HasIndex(u => new { u.OAuthProvider, u.OAuthId })
            .IsUnique()
            .HasFilter("\"OAuthProvider\" IS NOT NULL AND \"OAuthId\" IS NOT NULL");

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasFilter("\"Email\" IS NOT NULL");
    }
}
